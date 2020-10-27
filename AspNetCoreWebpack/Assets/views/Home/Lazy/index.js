// This file can be accessed with the alias: @/views/Home/Lazy
// This file will automatically be included in Home/Lazy view

import '@/views/Shared/_Layout';
import { Set } from '@/modules/output';
import styles from './index.lazy.scss';

document.addEventListener('DOMContentLoaded', () => {
  Set('views/Home/Lazy');
  document
    .getElementById('button')
    .addEventListener('click', () => styles.use());
});
