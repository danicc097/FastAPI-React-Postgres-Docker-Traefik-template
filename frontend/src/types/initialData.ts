/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export type Role = "user" | "manager" | "admin";

export interface CoreModel {}
export interface User {
  email: string;
  password: string;
  username: string;
  role: Role;
  verified: boolean;
  admin: boolean;
}
