// eslint-disable-next-line import/prefer-default-export
export function Set(bundle, extra) {
  let text = `${bundle} bundle is being used! :)`;
  if (extra !== undefined) {
    text += `<br/>${extra}`;
  }
  document.getElementById('output').innerHTML = text;
}
