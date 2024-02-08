import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
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
  active: string;
  total_button_presses: number;
  current: 182;
};

const initialState = { active: "1", total_button_presses: 0, current: 1 };

const baseURL = "https://opensea.io/assets/base/0xba5e05cb26b78eda3a2f8e3b3814726305dcac83/";

const reducer: FrameReducer<State> = (state, action) => {
  let newCurrent = 2;
    if (action.postBody?.untrustedData.buttonIndex === 1) {
      // Decrement current by 1, ensuring it doesn't go below 0
      newCurrent = Math.max(1, state.current - 1);
    } else if (action.postBody?.untrustedData.buttonIndex === 2) {
      // Increment current by 1, ensuring it doesn't exceed 182
      newCurrent = Math.min(182, state.current + 1);
    }

  return {
    total_button_presses: state.total_button_presses + 1,
    active: action.postBody?.untrustedData.buttonIndex
      ? String(action.postBody?.untrustedData.buttonIndex)
      : "1",
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

  // Here: do a server side side effect either sync or async (using await), such as minting an NFT if you want.
  // example: load the users credentials & check they have an NFT

  // Example with satori and sharp:
  // const imageUrl = await generateImage(frameMessage);

  console.log("info: state is:", state);

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
        {/* <FrameImage src={imageUrl} /> */}
        {/* <FrameInput text="put some text here" /> */}
        {/* <FrameButton onClick={dispatch({type: 'DECREMENT'})}>
          Prev
        </FrameButton>
        <FrameButton onClick={dispatch({type: 'INCREMENT'})}>
          Next
        </FrameButton> */}
        <FrameButton onClick={dispatch}>
          {state?.active === "1" ? "Active" : "Inactive"}
        </FrameButton>
        <FrameButton onClick={dispatch}>
          {state?.active === "2" ? "Active" : "Inactive"}
        </FrameButton>
        <FrameButton href={`${baseURL}${state.current}`} action="post_redirect">
          Buy on OS
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
