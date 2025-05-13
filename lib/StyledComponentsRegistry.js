"use client";

import React, { useState } from "react";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export function StyledComponentsRegistry({ children }) {
  const [sheet] = useState(() => new ServerStyleSheet());

  if (typeof window !== "undefined") {
    return children;
  }

  return (
    <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>
  );
}

// import React, { useState } from 'react';
// import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

// export function StyledComponentsRegistry({ children }) {
//   const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

//   return (
//     <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
//       {children}
//     </StyleSheetManager>
//   );
// }

// "use client";

// import { useServerInsertedHTML } from "next/navigation";
// import { ServerStyleSheet, StyleSheetManager } from "styled-components";
// import { useState } from "react";

// export function StyledComponentsRegistry({ children }) {
//   const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

//   useServerInsertedHTML(() => {
//     const styles = styledComponentsStyleSheet.getStyleElement();
//     styledComponentsStyleSheet.instance.clearTag();
//     return <>{styles}</>;
//   });

//   return (
//     <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
//       {children}
//     </StyleSheetManager>
//   );
// }
