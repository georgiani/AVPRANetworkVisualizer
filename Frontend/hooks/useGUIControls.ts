import { useState } from "react";

export default function useGUIControls(comsVal: boolean, infoBarVal: boolean, idsVal: boolean, vlVal: boolean): [boolean, boolean, boolean, boolean, () => void, () => void, () => void, () => void] {
    const [showCommmunityView, setShowCommunityView] = useState<boolean>(comsVal);
    const [showInfoBar, setShowInfoBar] = useState<boolean>(infoBarVal);
    const [showIds, setShowIds] = useState<boolean>(idsVal);
    const [showVLView, setShowVLView] = useState<boolean>(vlVal);

    const toggleComsViewFn: () => void = () => setShowCommunityView(!showCommmunityView);
    const toggleInfoBarFn: () => void = () => setShowInfoBar(!showInfoBar);
    const toggleIdsFn: () => void = () => setShowIds(!showIds);
    const toggleVLViewFn: () => void = () => setShowVLView(!showVLView);

    return [showCommmunityView, showInfoBar, showIds, showVLView, toggleComsViewFn, toggleInfoBarFn, toggleIdsFn, toggleVLViewFn];
}