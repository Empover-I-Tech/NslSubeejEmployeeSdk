const getHeaders = (headers = {}) => {
  return {
    'Content-Type': 'application/json',
    ...headers,
  };
};



// GET API
export const GET = async ({ url, headers = {} }) => {

  try {

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(headers),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data; // ✅ returning only data

  } catch (error) {
    throw error; // ✅ return error to caller
  }

};



// POST API
export const POST = async ({ url, body = {}, headers = {} }) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(headers),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data; // ✅ returning only data

  } catch (error) {

    throw error;

  }

};