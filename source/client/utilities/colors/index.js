export {brand} from './brand.js';

function alpha(percentage) {
  return Math.floor(255 * percentage).toString(16).padStart(2, '0');
}

export {alpha};