import React from 'react';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAsterisk } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  font-family: Inter;
  font-size: 1.875rem;
  font-weight: 800;
  color: #38a169;
  display: flex;
  flex-direction: row;
`;

const Subtitle = styled.div`
  font-size: 0.8rem;
  color: #a0aec0;
  text-transform: uppercase;
`;

export default () => (
  <Container>
    <div>
      <FontAwesomeIcon
        size="sm"
        style={{
          marginRight: "0.5rem",
        }}
        icon={faAsterisk}
      />
    </div>
    <div>
      beampipe <Subtitle>docs</Subtitle>
    </div>
  </Container>
);