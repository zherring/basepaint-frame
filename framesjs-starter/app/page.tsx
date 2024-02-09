import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
  getFrameMessage,
} from "frames.js/next/server";
import Link from "next/link";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";
import { generateImage } from "./generate-image";

type State = {
  current: number;
};

// Todos
// downloads 

const initialState = { current: 1 };

const baseURL = "https://opensea.io/assets/base/0xba5e05cb26b78eda3a2f8e3b3814726305dcac83/";

const reducer: FrameReducer<State> = (state, action) => {
  let newCurrent;
    if (action.postBody?.untrustedData.buttonIndex === 1) {
      // Decrement current by 1, ensuring it doesn't go below 0
      newCurrent = Math.max(1, state.current - 1);
    } else if (action.postBody?.untrustedData.buttonIndex === 2) {
      // Increment current by 1, ensuring it doesn't exceed 182
      newCurrent = Math.min(182, state.current + 1);
    }

  return {
    current: newCurrent,
  };
};


// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
    fetchHubContext: true,
  });

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  if (frameMessage) {
    const {
      isValid,
      buttonIndex,
      inputText,
      castId,
      requesterFid,
      casterFollowsRequester,
      requesterFollowsCaster,
      likedCast,
      recastedCast,
      requesterVerifiedAddresses,
      requesterUserData,
    } = frameMessage;

    console.log("info: frameMessage is:", frameMessage);
  }

  // then, when done, return next frame
  return (
    <div>
      Starter kit. <Link href="/debug">Debug</Link>
      <FrameContainer
        postUrl="/frames"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage src={"/processed_images/"+state.current+".png"} />
        <FrameButton onClick={dispatch}>
          Prev
        </FrameButton>
        <FrameButton onClick={dispatch}>
          Next
        </FrameButton>
        <FrameButton href={`${baseURL}${state.current}`} action="post_redirect"> Buy on OS </FrameButton>
      </FrameContainer>
    </div>
  );
}
