# summary

Publish an Experience Builder site to make it live.

# description

Each time you publish a site, you update the live site with the most recent updates. When you publish an Experience Builder site for the first time, you make the site's URL live and enable login access for site members.

In addition to publishing, you must activate a site to send a welcome email to all site members. Activation is also required to set up SEO for Experience Builder sites. To activate a site, update the status field of the Network type in Metadata API. (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_network.htm) Alternatively, in Experience Workspaces, go to Administration | Settings, and click Activate.

An email notification informs you when your changes are live on the published site. The site publish process is an async job that generates a jobId. To check the site publish status manually, query the BackgroundOperation object and enter the jobId as the Id. See ‘BackgroundOperation’ in the Object Reference for the Salesforce Platform for more information. (https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_backgroundoperation.htm)

If the job doesn’t complete within 15 minutes, it times out. You receive an error message and must restart the site publish process. Completed jobs expire after 24 hours and are removed from the database.

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
