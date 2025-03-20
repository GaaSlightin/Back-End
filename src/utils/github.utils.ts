import { IFetchRepoResponse, IGitHubBlobResponse, IRepoDetails, IRepoTree } from "../interfaces/github.interface";
import axios from "axios";
import { chooseFilesToBeCalculated, chooseFilesToCreatePostFrom } from "./aiClient";


/* ====== FOR DisplayUserRepoNames  ENDPOINTS */
export const getRepoDetails = async (AllUserRepoResponse: IFetchRepoResponse[]): Promise<IRepoDetails[]> => {
  try {
    const reposDetails = AllUserRepoResponse.map(repo => ({
      name: repo.name,
      about: repo.description || "",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics || []
    }));
    return reposDetails;
  } catch (error: any) {
    console.log("Error in getting repos details", error);
    throw "Error in getting repos details";
  }
};

export const FetchAllUserRepoService=async(userHandler:string, githubAccessToken: string):Promise<IFetchRepoResponse[]| string > =>{
 try{
  const repoUrl = `https://api.github.com/users/${userHandler}/repos`;
  const response = await axios.get<IFetchRepoResponse[]>(repoUrl, {
    headers: {
      Authorization: `token ${githubAccessToken}`, // Use the GitHub Access Token
    },
  }); // Explicitly type the response data
  const repos = response.data;

  
  if(!repos ||repos.length===0){
    return "Their is not repos got"
  }
  return repos
 }
 catch(error:any){
  console.log("Error in fetching all repos",error)
  return "Error in getting repos details"

 }

}


/* ====== FOR  GenerateCodeComplexity ENDPOINTS */
export const fetchAndDecodeContent = async (url: string): Promise<string> => {
   try {
     // Fetch the response from the provided URL
     const response = await axios.get<IGitHubBlobResponse>(url, {
       headers: {
         Accept: "application/vnd.github.v3+json", // GitHub API version header
       },
     });
 
     // Extract the content field from the response
     const base64Content = response.data.content;
 
     if (!base64Content) {
       throw new Error("Content field is missing in the response");
     }
 
     // Decode the Base64 content
     const decodedContent = Buffer.from(base64Content, "base64").toString("utf-8");
 
     return decodedContent;
   } catch (error: any) {
     console.error("Error fetching or decoding content:", error.message);
     throw error;
   }
};


export async function getRepoTree(owner: string, repo: string, accessToken: string){
   // First get the default branch reference
   const repoResponse: any = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
     headers: { Authorization: `token ${accessToken}` }
   });
 
   const defaultBranch: any = repoResponse.data.default_branch;
 
   // Get the reference for the default branch
   const refResponse: any = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
     headers: { Authorization: `token ${accessToken}` }
   });
 
   const commitSha: any = refResponse.data.object.sha;
 
   // Get the tree with recursive=1 to get all files
   const treeResponse: any = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`, {
     headers: { Authorization: `token ${accessToken}` }
   });
 
   // Filter to only include files
   return treeResponse.data.tree.filter((item: any) => item.type === 'blob');
}



export const extractRepoPathes=async(owner:string,repo:string,accessToken:string) : Promise<string[]>=>{
   try{
     const repoTree =<IRepoTree[]>await getRepoTree(owner,repo,accessToken)
     const repoPathes=repoTree.map( repo =>repo.path)
     return repoPathes
   }
   catch(error:any){
     console.log("Error in ranking the repo",error)
     return error
   }
}
export const fileSelectionForCodeCalculation=async(repoFilePathes:string[]):Promise<string[]> => {
  const selectedFiles= await chooseFilesToBeCalculated(repoFilePathes)
  return selectedFiles
}
export const fileSelectionForPost=async(repoFilePathes:string[]):Promise<string[]> => {
  const selectedFiles= await chooseFilesToCreatePostFrom(repoFilePathes)
  return selectedFiles
}