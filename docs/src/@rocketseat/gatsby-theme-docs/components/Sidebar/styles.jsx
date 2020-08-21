// import * as Styles from "@rocketseat/gatsby-theme-docs/src/components/Sidebar/styles.js";
import styled from '@emotion/styled'
import React from "react";


export * from "@rocketseat/gatsby-theme-docs/src/components/Sidebar/styles.js";

export const LogoContainer = styled.div`
  width: 100%;
  height: 100%;
  max-height: 100px;
  min-height: 100px;
  padding: 20px 0;
  a {
    width: 100%;
    height: 100%;
    padding-left: 30px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    text-decoration: none;
  }
`;
