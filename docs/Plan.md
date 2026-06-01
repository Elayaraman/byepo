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
    inviteCode
}

users:{
    id,
    org_id,
    role,
    email,
    password_hash
}

feature_flags:{
    id,
    org_id,
    name,
    enabled,
}

Routes:

ORG:
    POST /_api/org
    PUT /_api/org/:id
    DELETE /_api/org/:id
    GET /_api/org
    GET /_api/org/:id

flags:

    POST /_api/flag
    PUT /_api/flag/:id
    DELETE /_api/flag/:id
    GET /_api/flag
    GET /_api/flag/:id
    GET /_api/flag/check/:id

auth:

    POST /_api/auth/signup
    POST /_api/auth/login


User flow is Super admin can create organisation along with a invitecode. org admin can use the invitecode to singup as admin. after the code used it'll be rotated. 

Stack:
monorepo structure (no tools)
react for all FE applications 
    tailwind for styling
express for BE for simpler setup
SQLite for DB file based.

Trade-off nd enhancements:
user management is not implemented yet for this scope.
