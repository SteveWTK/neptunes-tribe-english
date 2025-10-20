"use client";

import styled from "styled-components";

const Select = styled.select`
  margin-top: 1rem;
  padding: 0.5rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: ${({ disabled }) => (disabled ? "#e5e7eb" : "white")};
  color: #1f2937;

  @media (prefers-color-scheme: dark) {
    border-color: #4b5563;
    background-color: ${({ disabled }) => (disabled ? "#4b5563" : "#374151")};
    color: white;
  }
`;

export default function SelectOption({
  options = [],
  selectedOption = "",
  onSelect,
  disabled = false,
}) {
  return (
    <Select value={selectedOption} onChange={onSelect} disabled={disabled}>
      <option value="" disabled>
        Select an answer
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
}
