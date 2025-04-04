import { ApiResponse } from "../utils/ApiResponse.js";

export const healthCheck = async (req, res) => {
  const response = new ApiResponse(200, null, "Service is up and running");

  return res.status(response.statusCode).json(response);
};
