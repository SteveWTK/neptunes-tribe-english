"use client";

import styled from "styled-components";

const Box = styled.div`
  background-color: ${(props) => (props.success ? "green" : "red")};
  color: white;
  padding: 1rem;
  margin: 2rem 0;
  border-radius: 0.5rem;
  text-align: center;
`;

export default function TestBox({ success }) {
  return (
    <Box success={success}>
      {success
        ? "Success! Styled Components is working 🎉"
        : "Error! Something is wrong 😢"}
    </Box>
  );
}
