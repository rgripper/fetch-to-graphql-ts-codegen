import gql from "graphql-tag";
import { useQuery, QueryHookOptions, QueryResult } from "@apollo/client";

type QueryNameData = {
  error: Error,
};

type Error = {
  code: number,
  message: string,
  errors: Errors[],
  status: string,
};

type Errors = {
  message: string,
  domain: string,
  reason: string,
  location: string,
  locationType: string,
};

type QueryNameVariables = {
  context: Context,
};

type Context = {
  client: Client,
  request: Request,
  user: User,
  clientScreenNonce: string,
  clickTracking: ClickTracking,
};

type ClickTracking = {
  clickTrackingParams: string,
};

type User = {};

type Request = {
  sessionId: string,
  internalExperimentFlags: InternalExperimentFlags[],
  consistencyTokenJars: ConsistencyTokenJars[],
};

type ConsistencyTokenJars = {};

type InternalExperimentFlags = {};

type Client = {
  hl: string,
  gl: string,
  visitorData: string,
  userAgent: string,
  clientName: string,
  clientVersion: string,
  osName: string,
  osVersion: string,
  browserName: string,
  browserVersion: string,
  screenWidthPoints: number,
  screenHeightPoints: number,
  screenPixelDensity: number,
  utcOffsetMinutes: number,
  userInterfaceTheme: string,
};

type UseQueryName = (
  options?: QueryHookOptions<QueryNameData, QueryNameVariables>
) => QueryResult<QueryNameData, QueryNameVariables>;

export const QUERY_NAME = gql`
  mutation QueryName($input: any) {
    get_unseen_countResult(input: $input)
      @rest(
        type: "Get_unseen_countResult"
        path: "youtubei/v1/notification/get_unseen_count?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"
        method: "POST"
      )

    error @typeof(name: "Error") {
      code
      message
      errors @typeof(name: "Errors") {
        message
        domain
        reason
        location
        locationType
      }
      status
    }
  }
`;

export const useQueryName: UseQueryName = useQuery.bind(null, QUERY_NAME);
