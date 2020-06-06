import gql from "graphql-tag";
import { useQuery, QueryHookOptions, QueryResult } from "@apollo/client";

interface QueryNameVariables {
  sessions: any[];
}
type UseQueryName = (
  options?: QueryHookOptions<QueryNameVariables, QueryNameVariables>
) => QueryResult<QueryNameVariables, QueryNameVariables>;

export const QUERY_NAME = gql`
  query QueryName {
    iframerpcResult
      @rest(
        type: "IframerpcResult"
        path: "o/oauth2/iframerpc?action=listSessions&client_id=508198334196-bgmagrg0a2rub674g0shidj8fnd50dji.apps.googleusercontent.com&origin=https%3A%2F%2Fdisqus.com&scope=profile%20email&ss_domain=https%3A%2F%2Fdisqus.com"
        method: "GET"
      ) {
      sessions
    }
  }
`;

export const useQueryName: UseQueryName = useQuery.bind(null, QUERY_NAME);
