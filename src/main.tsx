import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";


const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Auth0Provider
    domain="dev-txt7pa2k5znjr87y.us.auth0.com"
    clientId="stTvahLxOAbCPfNDXfz3jp3sxmCgVNHG"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>
    </React.StrictMode>
);