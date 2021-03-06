import React from 'react';
import styled from 'styled-components';
import qs from 'qs';
import Button from '../common/Button';

const PaginationBlock = styled.div`
  // width: 320px;
  margin: 0 auto;
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 3rem;
`;
const PageNumber = styled.div`

@media only screen and (max-width: 600Px) {
  display: none;
}
`;

const buildLink = ({ username,body,  page }) => {
  const query = qs.stringify({  page , body ,username });
  return username ? `/@${username}?${query}` : `/?${query}`;
};

const Pagination = ({ page, lastPage, username,  body}) => {
  return (
    <PaginationBlock>
      <Button
        disabled={page === 1}
        to={
          page === 1 ? undefined : buildLink({ username, body,  page: page - 1 })
        }
      >
        이전
      </Button>
      <PageNumber>{page}</PageNumber>
      <Button
        disabled={page === lastPage}
        to={
          page === lastPage
            ? undefined
            : buildLink({ username, body,  page: page + 1 })
        }
      >
        다음
      </Button>
    </PaginationBlock>
  );
};

export default Pagination;
