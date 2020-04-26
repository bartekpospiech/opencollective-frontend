import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { ArrowBack } from '@styled-icons/boxicons-regular';
import gql from 'graphql-tag';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { addCollectiveCoverData } from '../lib/graphql/queries';
import { compose } from '../lib/utils';
import { Router } from '../server/pages';

import Body from '../components/Body';
import Button from '../components/Button';
import CollectiveNavbar from '../components/CollectiveNavbar';
import Container from '../components/Container';
import EditUpdateForm from '../components/EditUpdateForm';
import ErrorPage from '../components/ErrorPage';
import Footer from '../components/Footer';
import { Box, Flex } from '../components/Grid';
import Header from '../components/Header';
import Link from '../components/Link';
import MessageBox from '../components/MessageBox';
import { H1 } from '../components/Text';
import { withUser } from '../components/UserProvider';

const BackButtonWrapper = styled(Container)`
  position: relative;
  color: #71757a;
  margin-right: 62px;
  margin-left: 20px;
  @media (max-width: 600px) {
    margin-left: 0;
  }
`;

const CreateUpdateWrapper = styled(Flex)`
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

class CreateUpdatePage extends React.Component {
  static getInitialProps({ query: { collectiveSlug, action } }) {
    return { slug: collectiveSlug, action };
  }

  static propTypes = {
    slug: PropTypes.string, // for addCollectiveCoverData
    action: PropTypes.string, // not used atm, not clear where it's coming from, not in the route
    createUpdate: PropTypes.func, // from addMutation/createUpdateQuery
    data: PropTypes.object.isRequired, // from withData
    LoggedInUser: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { update: {}, status: '', error: '' };
  }

  createUpdate = async update => {
    const {
      data: { Collective },
    } = this.props;
    try {
      update.collective = { id: Collective.id };
      const res = await this.props.createUpdate(update);
      this.setState({ isModified: false });
      return Router.pushRoute(`/${Collective.slug}/updates/${res.data.createUpdate.slug}`);
    } catch (e) {
      this.setState({ status: 'error', error: e.message });
    }
  };

  handleChange = (attr, value) => {
    const update = this.state.update;
    update[attr] = value;
    this.setState({ update, isModified: true });
  };

  render() {
    const { data } = this.props;
    const { LoggedInUser } = this.props;

    if (!data.Collective) {
      return <ErrorPage data={data} />;
    }

    const collective = data.Collective;
    const isAdmin = LoggedInUser && LoggedInUser.canEditCollective(collective);

    return (
      <div className="CreateUpdatePage">
        <style jsx global>
          {`
            .CreateUpdatePage .Updates .update {
              border-top: 1px solid #cacbcc;
            }
          `}
        </style>
        <Header collective={collective} LoggedInUser={LoggedInUser} />

        <Body>
          <CollectiveNavbar collective={collective} isAdmin={isAdmin} />
          <CreateUpdateWrapper className="content" mt={4} alignItems="baseline">
            <BackButtonWrapper>
              <Link href={`/${collective.slug}/updates`}>
                <Container display="flex" color="#71757A" fontSize="14px" alignItems="center">
                  <ArrowBack size={18} />
                  <Box as="span" mx={2}>
                    Back
                  </Box>
                </Container>
              </Link>
            </BackButtonWrapper>
            <Container width={1}>
              {!isAdmin && (
                <div className="login">
                  <p>
                    <FormattedMessage
                      id="updates.create.login"
                      defaultMessage="You need to be logged in as a core contributor of this collective to be able to create an update."
                    />
                  </p>
                  <p>
                    <Button className="blue" href={`/signin?next=/${collective.slug}/updates/new`}>
                      <FormattedMessage id="signIn" defaultMessage="Sign In" />
                    </Button>
                  </p>
                </div>
              )}
              {isAdmin && (
                <Container my={3}>
                  <H1 textAlign="left" fontSize="34px">
                    <FormattedMessage id="updates.new.title" defaultMessage="New update" />
                  </H1>
                </Container>
              )}
              {isAdmin && <EditUpdateForm collective={collective} onSubmit={this.createUpdate} />}
              {this.state.status === 'error' && (
                <MessageBox type="error" withIcon>
                  <FormattedMessage
                    id="updates.new.error"
                    defaultMessage="Update failed: {err}"
                    values={{ err: this.state.error }}
                  />
                </MessageBox>
              )}
            </Container>
          </CreateUpdateWrapper>
        </Body>
        <Footer />
      </div>
    );
  }
}

const createUpdateQuery = gql`
  mutation createUpdate($update: UpdateInputType!) {
    createUpdate(update: $update) {
      id
      slug
      title
      summary
      html
      createdAt
      publishedAt
      updatedAt
      tags
      image
      isPrivate
      makePublicOn
      collective {
        id
        slug
      }
      fromCollective {
        id
        type
        name
        slug
        image
      }
    }
  }
`;

const addMutation = graphql(createUpdateQuery, {
  props: ({ mutate }) => ({
    createUpdate: async update => {
      return await mutate({ variables: { update } });
    },
  }),
});

const addGraphQL = compose(addCollectiveCoverData, addMutation);

export default withUser(addGraphQL(CreateUpdatePage));
