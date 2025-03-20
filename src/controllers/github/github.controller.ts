import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { IUser } from "../../interfaces/auth.interfaces";
import repositoryModel from "../../models/repository.model"; // Import the new Repository model
import { IFetchRepoResponse, IGitHubBlobResponse, IRepoTree, IRepoTreeResposne } from "../../interfaces/github.interface";
import scrapeRawCode from "../../utils/rawGitHubScraper";
import { retrieveFileOutFromJSON } from "@mistralai/mistralai/models/components";
import { extractRepoPathes, FetchAllUserRepoService, fetchAndDecodeContent, fileSelection, getRepoTree, storeRepoNames } from "../../utils/github.utils";
import { console } from "inspector";
import { calculateComplexity } from "../../utils/aiClient";

export const DisplayUserRepoNames = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    if(!user){
      res.status(400).json({
        status:"Failed",
        message:"User Not authorized"
      })
    }
    const userHandler=user.userName; // Extract the handler parameter
    if (!userHandler) {
      res.status(400).json({
        status: "fail",
        message: "Handler parameter is required",
      });
      return;
    }

    /* ========================== FETCH USER REPOS ================================= */  
    const repos =await FetchAllUserRepoService(userHandler);

    /* ========================== STORE USER REPORISTORY NAMES ================================= */
    const repoNames= await storeRepoNames(<IFetchRepoResponse[]>repos,user._id)

    if (!repos || repos.length === 0) {
      res.status(404).json({
        status: "fail",
        message: "No repositories found for this user",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: repoNames,
    });
  } catch (error: any) {
    next(error);
  }
};



export const GenerateCodeComplexity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { repo } = req.params;
    const user = req.user as IUser;
    const userHandle = user.userName;

    if (!userHandle || !repo) {
      return res.status(400).json({
        status: "fail",
        message: "Owner and Repo parameter are required",
      });
    }

    const githubAccessToken = user.githubAccessToken;

    /* ================================= GET THE REPO TREE =============== */
    const repoTree = <IRepoTree[]>await getRepoTree(userHandle, repo, githubAccessToken);

    /* =============================== EXTRACT THE REPO FILE PATHES==================== */
    const repoPathes = await extractRepoPathes(userHandle, repo, githubAccessToken);

    /* ======================================= Files to Calculate Complexity ============================= */
    const filesTobeCalculated = await fileSelection(repoPathes);
    const filesTobeCalculatedURl = repoTree
      .filter(repo => filesTobeCalculated.includes(repo.path))
      .map(repo => repo.url);
    console.log("filesTobeCalculatedURl",filesTobeCalculatedURl)
    /* ====================================== Fetch and Combine Code ====================================== */
    let combinedCode = "";
    for (const fileUrl of filesTobeCalculatedURl) {
      try {
        const code = await fetchAndDecodeContent(fileUrl);
        combinedCode += code+"\n"; // Add file separation for clarity
      } catch (error) {
        console.error(`Error fetching file ${fileUrl}:`, error);
      }
    }

    if (!combinedCode) {
      return res.status(400).json({
        status: "fail",
        message: "No valid code could be fetched from the selected files.",
      });
    }
    /* ======================================calculate complexity ====================================== */
    let complexityPercentage = 0;
    try {
      complexityPercentage = await calculateComplexity(combinedCode); // Send combined code to LLM
    } catch (error) {
      console.error("Error calculating complexity:", error);
      return res.status(500).json({
        status: "fail",
        message: "Error calculating code complexity.",
      });
    }

    res.status(200).json({
      status: "success",
      //data: combinedCode,
      complexityPercentage
    });
  } catch (error: any) {
    next(error);
  }
};
