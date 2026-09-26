"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { project } from "./sanity/schema";

export default defineConfig({
  name: "dayfour",
  title: "DɅYFOVR",
  basePath: "/studio",
  projectId,
  dataset,
  apiVersion,
  plugins: [structureTool()],
  schema: { types: [project] },
});
