import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/dm-sans/wght.css';
import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import './styles.css';
import App from './App';
import { loadCatalog } from './data/catalog';

const root = ReactDOM.createRoot(document.getElementById('root'));
const unavailable = <main className="app-status"><h1>We couldn’t load the patterns just now.</h1><p>Please refresh the page in a moment, or browse the full collection on Etsy.</p><a className="button button-primary" href="https://www.etsy.com/shop/BelleBloomThreads">Visit BelleBloomThreads on Etsy</a></main>;

const showUnavailable = (error) => { console.error(error); root.render(unavailable); };
// The published blog is pre-built into static pages; in development the same pages render here.
const blogRoute = import.meta.env.DEV && /^\/blog(?:\/([^/]+))?\/?$/.exec(window.location.pathname);

if (blogRoute) import('./blog/client').then(({ renderBlog }) => renderBlog(root, blogRoute[1])).catch(showUnavailable);
else loadCatalog().then(() => root.render(<React.StrictMode><App /></React.StrictMode>), showUnavailable);
