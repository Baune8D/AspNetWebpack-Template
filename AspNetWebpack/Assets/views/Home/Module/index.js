// This file can be accessed with the alias: @/views/Home/Module
// This file will automatically be included in Home/Module view

import '@/views/Shared/_Layout';
import { Set } from '@/modules/output';
import styles from './index.module.scss';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('body').classList.add(styles.red);
  Set(
    'views/Home/Module',
    `
    If you see red background then class has been added to body.<br/>
    You can confirm using your browser devtools.
  `,
  );
});
