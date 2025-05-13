"use client";

import styled from "styled-components";

const AboutCard = styled.div`
  background-color: white;
  margin: 1.5rem;
  padding: 1.5rem;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: var(--color-accent-50);
`;

export default function About() {
  return (
    <>
      <AboutCard>The Tribe is here to change the world</AboutCard>
    </>
  );
}
