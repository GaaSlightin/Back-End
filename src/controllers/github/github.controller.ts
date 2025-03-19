import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { IUser } from "../../interfaces/auth.interfaces";
import repositoryModel from "../../models/repository.model"; // Import the new Repository model
import { IFetchRepoResponse, IGitHubBlobResponse, IRepoTree, IRepoTreeResposne } from "../../interfaces/github.interface";
import scrapeRawCode from "../../utils/rawGitHubScraper";
import { retrieveFileOutFromJSON } from "@mistralai/mistralai/models/components";
import { extractRepoPathes, FetchAllUserRepoService, fetchAndDecodeContent, getRepoTree, storeRepoNames } from "../../utils/github.utils";

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
    const user =req.user as IUser
    const userHandle= user.userName
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
    const repoTree = <IRepoTree[]>await getRepoTree(userHandle, repo, githubAccessToken);


    /* =============================== EXTRACT THE REPO FILE PATHES==================== */
    /*const repoPathes = await extractRepoPathes(userHandle, repo, githubAccessToken);
    console.log("repoPathes",repoPathes)*/





    /* ======================================TAKE THE CODE FILE URL FROM REPO TREE REPONSE AND DECODE AND DISPLAY THE CODE======================================*/
    const code = await fetchAndDecodeContent(repoTree[5].url)
    console.log("Code",code)



    
    res.status(200).json({
      status: "success",
      test: "NOT DOING MY FUNCTIONALLITY YET",
      data:repoTree
    });
  } catch (error: any) {
    next(error);
  }
};

