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

Org :{
    id,
    name,
    inviteCode,
}

Users:{
    id,
    org_id,
    role,
    email,
}