export async function successResponse(res, message = "", data = null) {
    res.status(200).json({
      error: false,
      status: 200,
      message,
      data,
    });
  }
  export async function errorResponse(res, statusCode, message) {
    return res.status(statusCode).json({
      error: true,
      status: statusCode,
      message,
      data: null,
    });
  }
  
  
  //errorResponse
  