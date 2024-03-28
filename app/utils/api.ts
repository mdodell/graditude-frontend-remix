import ky from "ky";

export const http = ky.create({
  prefixUrl: process.env.API_URL,
});
