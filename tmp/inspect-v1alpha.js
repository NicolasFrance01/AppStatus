
const { google } = require('googleapis');

const v1alpha = google.firebaseappdistribution('v1alpha');
console.log('Base URL:', v1alpha.context._options.rootUrl || 'Not found');
console.log('Methods under projects.apps.releases:', Object.keys(v1alpha.projects.apps.releases).filter(k => typeof v1alpha.projects.apps.releases[k] === 'function'));
