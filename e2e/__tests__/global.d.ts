// globals defined in jest.config.js need to be included in this `d.ts`
// file to avoid TS lint errors
//! NOTE containers are not resolved in browser!
//! https://stackoverflow.com/questions/46987726/linked-docker-compose-containers-making-http-requests
declare var FRONTEND_URL: string
