const error_handler = (request: Request): Response => {
  return new Response('Not Found.', { status: 404 });
};

export { error_handler };
