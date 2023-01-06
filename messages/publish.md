# summary

Publish an Experience Builder site to make it live.

# description

Each time you publish it, you update the live site with the most recent updates. When you publish an Experience Builder site for the first time, you make the site's URL live and enable login access for site members.

Additionally, to send a welcome email to all site members, you must activate the site. (Activation is also required to successfully set up SEO for Experience Builder sites.) To activate a site, update the status field of the Network type in the Metadata API. Alternatively, in Experience Workspaces, go to Administration | Settings, and click Activate.

Subsequently, each time you publish the site, you update the live site with all changes made to the site since it was last published.

An email notification informs you when your changes are live.

# examples

- Publish the Experience Builder site with name "My Customer Site':

  <%= config.bin %> <%= command.id %> --name 'My Customer Site'

# flags.name.summary

Name of the Experience Builder site to publish.

# response.styleHeader

Publish Site Result

# response.message

We’re publishing your changes now. You’ll receive an email confirmation when your changes are live.

# error.communityNotExists

The %s site doesn't exist. Verify the site name and try publishing it again.
