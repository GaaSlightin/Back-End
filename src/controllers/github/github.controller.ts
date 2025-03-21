import { Request, Response, NextFunction } from "express";
import { IUser } from "../../interfaces/auth.interfaces";
import repositoryModel from "../../models/repository.model"; // Import the new Repository model
import {
  IFetchRepoResponse,
  IRepoTree,
} from "../../interfaces/github.interface";

import {
  extractRepoPathes,
  FetchAllUserRepoService,
  fetchAndDecodeContent,
  fileSelectionForCodeCalculation,
  getRepoTree,
  getRepoDetails,
  fileSelectionForPost,
} from "../../utils/github.utils";
import { console } from "inspector";
import { calculateComplexity, createPost } from "../../utils/aiClient";

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
    const repos = await FetchAllUserRepoService(
      userHandler,
      user.githubAccessToken
    );

    /* ========================== STORE USER REPORISTORY NAMES ================================= */
    const repoNames = await getRepoDetails(<IFetchRepoResponse[]>repos);

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
    const filesTobeCalculated = await fileSelectionForCodeCalculation(
      repoPathes
    );
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

    console.log(totalComplexity);
    totalComplexity = totalComplexity * 10;
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

export const GeneratePost = async (
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
    const filesTobeCalculated = await fileSelectionForPost(repoPathes);
    console.log("Files that llm choosen", filesTobeCalculated);

    /*=========================================File URLs========================= */

    const filesTobeCalculatedURl = repoTree
      .filter((repo) => filesTobeCalculated.includes(repo.path))
      .map((repo) => repo.url);
    //console.log("files to be calculated url",filesTobeCalculatedURl)

    /* ======================================Calculate Complexity for Each File======================================*/

    let combinedCode = "";

    for (const fileUrl of filesTobeCalculatedURl) {
      try {
        const fileContent = await fetchAndDecodeContent(fileUrl); // Fetch file content
        combinedCode += `${fileUrl} :\n ${fileContent}\n\n`; // Append file content with its URL for context
      } catch (error) {
        console.error(`Error processing file ${fileUrl}:`, error);
      }
    }
    const post = await createPost(combinedCode);
    /* ====================================== Compute Complexity as Percentage ====================================== */

    res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (error: any) {
    next(error);
  }
};
export const returnRanks=async(req:Request,res:Response,next:NextFunction)=>{
  try{
    const user = req.user as IUser;
    const userHandle = user.userName;
    if (!userHandle) {
      res.status(400).json({
        status: "fail",
        message: "user not authenticated",
      });
      return;
    }
    const repoWithRanks= await repositoryModel.find({
      userId:user._id
    })
    if(!repoWithRanks || repoWithRanks.length===0){
      res.status(400).json({
        status:"failed",
        message:"user doesnot have ranked repos"
      });
      return;
    }
    res.status(200).json({
      status:"Success",
      message:repoWithRanks
    })
  }
  catch(error:any){
    next(error)
  }
}