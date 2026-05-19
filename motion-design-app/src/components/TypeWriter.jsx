import { useCurrentFrame } from 'remotion';

export const TypeWriter = ({ text, speed = 3, style = {}, cursorColor = '#333' }) => {
  const frame = useCurrentFrame();
  const charsToShow = Math.min(Math.floor(frame / speed), text.length);
  const displayed = text.slice(0, charsToShow);
  const showCursor = frame % 30 < 15;
  const done = charsToShow >= text.length;

  return (
    <span style={{ fontFamily: 'monospace', ...style }}>
      {displayed}
      {(!done || showCursor) && (
        <span style={{ color: cursorColor, opacity: showCursor ? 1 : 0 }}>|</span>
      )}
    </span>
  );
};
