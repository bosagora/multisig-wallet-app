import {Pagination, SearchInput} from 'msw-ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {MembersList} from 'components/membersList';
import {StateEmpty} from 'components/stateEmpty';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useMSWalletDetailsQuery} from 'hooks/useMSWalletDetails';
import {useMSWalletMembers} from '../hooks/useMSWalletMembers';
import {useDebouncedState} from 'hooks/useDebouncedState';
const MEMBERS_PER_PAGE = 20;

const Community: React.FC = () => {
  const {t} = useTranslation();

  const [page, setPage] = useState(1);
  const [debouncedTerm, searchTerm, setSearchTerm] = useDebouncedState('');

  const {data: walletDetails, isLoading: detailsAreLoading} =
    useMSWalletDetailsQuery();

  const {
    data: {members, filteredMembers},
    isLoading: membersLoading,
  } = useMSWalletMembers(
    walletDetails ? walletDetails.address : '',
    debouncedTerm
  );

  const totalMemberCount = members.length;
  const filteredMemberCount = filteredMembers.length;
  const displayedMembers = filteredMemberCount > 0 ? filteredMembers : members;

  /*************************************************
   *                    Handlers                   *
   *************************************************/
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.trim());
  };

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (detailsAreLoading || membersLoading) return <Loading />;

  return (
    <PageWrapper
      title={`${totalMemberCount} ${t('labels.members')}`}
      {...{
        description: t('explore.explorer.walletBased'),
      }}
    >
      <BodyContainer>
        <SearchAndResultWrapper>
          {/* Search input */}
          <InputWrapper>
            <SearchInput
              placeholder={t('labels.searchPlaceholder')}
              value={searchTerm}
              onChange={handleQueryChange}
            />
          </InputWrapper>

          {/* Members List */}
          {membersLoading ? (
            <Loading />
          ) : (
            <>
              {debouncedTerm !== '' && !filteredMemberCount ? (
                <StateEmpty
                  type="Object"
                  mode="inline"
                  object="magnifying_glass"
                  title={t('labels.noResults')}
                  description={t('labels.noResultsSubtitle')}
                />
              ) : (
                <>
                  {debouncedTerm !== '' && !membersLoading && (
                    <ResultsCountLabel>
                      {filteredMemberCount === 1
                        ? t('labels.result')
                        : t('labels.nResults', {count: filteredMemberCount})}
                    </ResultsCountLabel>
                  )}
                  <MembersList
                    // token={daoToken}
                    members={displayedMembers.slice(
                      (page - 1) * MEMBERS_PER_PAGE,
                      page * MEMBERS_PER_PAGE
                    )}
                  />
                </>
              )}
            </>
          )}
        </SearchAndResultWrapper>

        {/* Pagination */}
        <PaginationWrapper>
          {(displayedMembers.length || 0) > MEMBERS_PER_PAGE && (
            <Pagination
              totalPages={
                Math.ceil(
                  (displayedMembers.length || 0) / MEMBERS_PER_PAGE
                ) as number
              }
              activePage={page}
              onChange={(activePage: number) => {
                setPage(activePage);
                window.scrollTo({top: 0, behavior: 'smooth'});
              }}
            />
          )}
        </PaginationWrapper>
      </BodyContainer>
    </PageWrapper>
  );
};

const BodyContainer = styled.div.attrs({
  className: 'mt-5 desktop:space-y-8',
})``;

const SearchAndResultWrapper = styled.div.attrs({className: 'space-y-3'})``;

const ResultsCountLabel = styled.p.attrs({
  className: 'font-bold text-ui-800 ft-text-lg',
})``;

const PaginationWrapper = styled.div.attrs({
  className: 'flex mt-8',
})``;

const InputWrapper = styled.div.attrs({
  className: 'space-y-1',
})``;

export default withTransaction('Community', 'component')(Community);
