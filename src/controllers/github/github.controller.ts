import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { IUser } from "../../interfaces/auth.interfaces";
import repositoryModel from "../../models/repository.model"; // Import the new Repository model
import {
  IFetchRepoResponse,
  IGitHubBlobResponse,
  IRepoTree,
  IRepoTreeResposne,
} from "../../interfaces/github.interface";
import scrapeRawCode from "../../utils/rawGitHubScraper";
import { retrieveFileOutFromJSON } from "@mistralai/mistralai/models/components";
import {
  extractRepoPathes,
  FetchAllUserRepoService,
  fetchAndDecodeContent,
  fileSelection,
  getRepoTree,
  getRepoNames,
} from "../../utils/github.utils";
import { console } from "inspector";
import { calculateComplexity } from "../../utils/aiClient";

export const DisplayUserRepoNames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;
    if (!user) {
      res.status(400).json({
        status: "Failed",
        message: "User Not authorized",
      });
    }
    const userHandler = user.userName; // Extract the handler parameter
    if (!userHandler) {
      res.status(400).json({
        status: "fail",
        message: "Handler parameter is required",
      });
      return;
    }

    /* ========================== FETCH USER REPOS ================================= */
    const repos = await FetchAllUserRepoService(userHandler);

    /* ========================== STORE USER REPORISTORY NAMES ================================= */
    const repoNames = await getRepoNames(<IFetchRepoResponse[]>repos, user._id);

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

export const GenerateCodeComplexity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { repo } = req.params;
    const user = req.user as IUser;
    const userHandle = user.userName;
    if (!userHandle || !repo) {
      res.status(400).json({
        status: "fail",
        message: "Owner and Repo parameter are required",
      });
      return;
    }

    const githubAccessToken = user.githubAccessToken; // Use the correct property name
    console.log(githubAccessToken);

    /* ================================= GET THE REPO TREE =============== */
    const repoTree = <IRepoTree[]>(
      await getRepoTree(userHandle, repo, githubAccessToken)
    );

    /* =============================== EXTRACT THE REPO FILE PATHES==================== */
    const repoPathes = await extractRepoPathes(
      userHandle,
      repo,
      githubAccessToken
    );
    //console.log("repoPathes",repoPathes)

    /* =======================================Files That been choosen to calculate complexity============================= */
    const filesTobeCalculated = await fileSelection(repoPathes);
    //console.log("Files that llm choosen",filesTobeCalculated)

    /*=========================================File URLs========================= */

    const filesTobeCalculatedURl = repoTree
      .filter((repo) => filesTobeCalculated.includes(repo.path))
      .map((repo) => repo.url);
    //console.log("files to be calculated url",filesTobeCalculatedURl)

    /* ======================================Calculate Complexity for Each File======================================*/

    let totalComplexity = 0;
    let combinedCode = "";

    for (const fileUrl of filesTobeCalculatedURl) {
      try {
        const fileContent = await fetchAndDecodeContent(fileUrl); // Fetch file content
        combinedCode += `${fileUrl} :\n ${fileContent}\n\n`; // Append file content with its URL for context
      } catch (error) {
        console.error(`Error processing file ${fileUrl}:`, error);
      }
    }
    totalComplexity = await calculateComplexity(combinedCode);
    /* ====================================== Compute Complexity as Percentage ====================================== */

    console.log(totalComplexity)
    totalComplexity=totalComplexity*10;
    let existedRepo = await repositoryModel.findOne({
      name: repo,
    });
    if (!existedRepo) {
      existedRepo = await repositoryModel.create({
        userId: user._id,
        name: repo,
        codeComplexity: totalComplexity,
      });
    }

    res.status(200).json({
      status: "success",
      data: existedRepo,
    });
  } catch (error: any) {
    next(error);
  }
};
