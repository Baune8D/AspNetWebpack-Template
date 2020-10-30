// This file can be accessed with the alias: @/views/Home/Inject
// This file will automatically be included in Home/Inject view

import '@/views/Shared/_Layout';
import { Set } from '@/modules/output';
import './index.scss?inject';

document.addEventListener('DOMContentLoaded', () => {
  Set(
    'pages/RazorPage',
    `
    If you see blue background then index.scss has been injected as a style tag.<br/>
    You can confirm using your browser devtools.
  `,
  );
});
