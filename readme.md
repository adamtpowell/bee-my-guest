# Bee My Guest

An app to share dining hall guest passes.

## Architecture

The portal supports login and the list of schools.

The school servers handle single schools connections. They report their creation and destruction to the portal, so it
has an up to date list of all of the school servers currently running.

The portal has a well known location, which the client uses to get access to the school servers.
