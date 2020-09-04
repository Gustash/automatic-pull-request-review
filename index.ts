import * as core from '@actions/core';
import * as github from '@actions/github';

type RequestEvent = 'APPROVE' | 'COMMENT' | 'DISMISS' | 'REQUEST_CHANGES';

const requestEvent = core.getInput('event') as RequestEvent;
const body = core.getInput('body');

if (!process.env.GITHUB_TOKEN) {
  core.setFailed('You have not passed a GITHUB_TOKEN to this action');
}

const octokit = github.getOctokit(process.env.GITHUB_TOKEN as string);

if (
  (requestEvent === 'COMMENT' || requestEvent === 'REQUEST_CHANGES') &&
  !body
) {
  core.setFailed('Event type COMMENT & REQUEST_CHANGES require a body.');
}

const pullRequest = github.context.payload['pull_request'];

if (!pullRequest) {
  core.setFailed('This action is meant to be ran on pull requests');
}

const pullNumber: number = (<any>pullRequest)['node_id'];

if (requestEvent === 'DISMISS') {
  octokit.pulls
    .listReviews({
      ...github.context.repo,
      pull_number: pullNumber,
    })
    .then(({data}) => {
      data.find(({user}) => {
        console.log(user);
        return true;
      });
    });
  // octokit.pulls.dismissReview({
  //   ...github.context.repo,
  //   pull_number: (<any>pullRequest)['node_id'],
  //   message: body,
  //   review_id: octokit.pulls.
  // });
} else {
  octokit.pulls
    .createReview({
      ...github.context.repo,
      pull_number: pullNumber,
      event: requestEvent,
      body,
    })
    .catch((err) => {
      core.error(err);
      core.setFailed(err.message);
    });
}

// octokit
//   .graphql(
//     `
//       mutation {
//         addPullRequestReview(input: {
//           pullRequestId: "${(<any>pullRequest)['node_id']}",
//           event: ${requestEvent},
//           body: "${body}"
//         }) {clientMutationId} }`,
//   )
//   // .then()
//   .catch((err) => {
//     core.error(err);
//     core.setFailed(err.message);
//   });
