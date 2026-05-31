## **Byepo - Feature flag management**
**Requirements :**
A admin panel for Application Admin to create orgs.
 - User : Super Admin (Hard coded user)
 - Role: Create organisation
 - Case :  when creating org we generate a invitecode
 
Organisation Admin for org admins to manage feature flags.
 - User : Org Admin
 - Role: add or remove Feature flags
 - adming can sign up using mail and with the invite code. login feature will be default.

End user panel.
- no need for login in this scope
- there will be a form with input when submit will be notified as is it enabled for the org.

Entities we need :
Org 
Users

org :{
    id,
    name,
    inviteCode,
    isActivated,
}

users:{
    id,
    org_id,
    role,
    email,
    password
}

feature_flafs:{
    id,
    org_id,
    name,
    enabled,
}

APIS:

PREFIX : /_api/
SUPER ADMIN: 
    - POST: /org/create
    - PUT: /org/update?=?=id
    - DELETE: /org/delete?=id
    - GET: /org and /org?=id

ORG ADMIN:  /org_id
    - POST: /signup
    - POST: /login
    - POST: /flag/create
    - PUT: /flag/update=id
    - DELETE: /flag/delete?=id
    - GET: /flag and /flag?=id

END USER:  /org_id
     - GET: /flag and /flag?=id