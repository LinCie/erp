import { Elysia } from "elysia";
import { auth } from "../../lib/auth/auth";

export const authPlugin = new Elysia({ name: "auth" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      const organization = await auth.api.getFullOrganization({ headers });

      if (!session) return status(401);

      return {
        user: session.user,
        session: session.session,
        organization: organization,
      };
    },
  },
});
