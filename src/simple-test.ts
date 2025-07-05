// Simple test handler to debug Lambda issues
exports.handler = async (event: any, context: any) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Simple test handler working',
      timestamp: new Date().toISOString(),
      event: event.httpMethod || 'unknown',
      path: event.path || 'unknown'
    })
  };
};