import React, {useEffect} from 'react'
import {Layout} from "../components/Layout"
import {HohApiWrapper} from "../src/client/clientApi"
import {capitalize, debug, repeat} from "../src/utils"
import {logOut, useUser} from "../src/client/userApi"
import {baseGameNameShort, gameName} from "../components/constants"
import {Badge, Button as Btn, CircularProgress, IconButton} from "@mui/material"
import {AttachMoney, FavoriteOutlined, Logout, Settings, Star, ThumbDown} from "@mui/icons-material"
import {cardImgUrlForName, hiddenCardPath, hiresCardHeight, hiresCardWidth} from "../src/cardData"
import {SimpleTooltip} from "../components/SimpleTooltip"
import {DeckSelect} from "../components/DeckSelect"
import {LoginFirst} from "../components/LoginFirst"
import {LoadingProgress} from "../components/LoadingProgress"
import {JoinDiscord} from "../components/JoinDiscord"
import {Maybe} from "../interfaces/baseTypes"
import {OptionsPanel} from '../components/OptionsPanel'
import useWindowDimensions from "../src/client/useWindowSize"

const fontSize = "2vh"
const Button = props => <Btn labelStyle={{fontSize}} {...props}/>
export const resourceSymbol = <>&#x25B3;</> // △
// const oldWitsEyeSymbol = <>&#x1F441;</> // 👁
export const physSymbol = <>&#x270A;</> // ✊
export const witsSymbol = <>&#x233E;</> // ⌾

export function HomeLogic() {
    const {user, userPointer, isAuthenticated} = useUser()
    const [start, setStart] = React.useState(0)
    //const [allDecks, setAllDecks] = React.useState(predefinedDecks)
    const [deckCards, setDeckCards] = React.useState([])
    const [badWords, setBadWords] = React.useState([])
    const [cards, setCards] = React.useState<string[]>([])

    //const [newestCards, setNewestCards] = React.useState([])

    const {height, width} = useWindowDimensions()

    const f2 = height / hiresCardHeight / 4.8
    const cardHeight = hiresCardHeight * f2

    function vote(name: string, delta: number) {
        debug("vote", name, delta, "by user with session", user?.sessionToken)

        setCards(cards.filter(x => x !== name))

        fetch("/api/vote", {
            method: "POST",
            body: JSON.stringify({name, delta, sessionToken: user?.sessionToken})
        }).then(x => x.json()).then(x => {
            debug("vote result", x)
        })
    }

    function getImg(name: Maybe<string>, voting?: boolean, heightOverride?: number, style?: any, oldMethod?: boolean) {
        let actualHeight = heightOverride === undefined ? cardHeight * 2.4 : heightOverride
        const img = <img src={name ? cardImgUrlForName(name, oldMethod) : hiddenCardPath}
                         height={actualHeight}
                         width={Math.floor(actualHeight / hiresCardHeight * hiresCardWidth)}
                         alt="" style={style || {}}/>

        const Badge2 = props => <Badge {...props}
                                       anchorOrigin={{vertical: "bottom", horizontal: props.left ? "left" : "right"}}/>
        return (!voting || !name) ? img : <div key={name}>
            <Badge2 left badgeContent={<IconButton color="info" onClick={() => vote(name, -1)}>
                <ThumbDown fontSize="large"/>
            </IconButton>}>
                <Badge2 badgeContent={<IconButton color="error" onClick={() => vote(name, +1)}>
                    <FavoriteOutlined fontSize="large"/>
                </IconButton>}>
                    {img}
                </Badge2>
            </Badge2>
        </div>
    }

    /*function handleError(err) {
        setMessage(err?.error || JSON.stringify(err))
    }*/

    function fetchDeck(id
    ) {
        fetch("/api/deck/" + id).then(x => x.json()).then(deckObj => {
            deckObj?.deck && setDeckCards(deckObj.deck)
        })
    }

    useEffect(() => {
            /*fetch("/api/allDecks").then(x => x.json()).then(allDecksValue => {
                allDecksValue && setAllDecks(allDecksValue)
            })*/

            fetchDeck(user?.deck || "beta1")

            fetch("/api/badWords").then(x => x.json()).then(setBadWords)

            user && fetch("/api/cards/newest").then(x => x.json()).then(cards => {
                //setNewestCards(cards)
                debug("newest", cards)
                const cardNames = cards.map(x => x.id)
                fetch("/api/votes/" + user?.username).then(x => x.json()).then(votes => {
                    setCards(cardNames.filter(x => !votes.find(y => y.name === x)))
                })
            })
        }, []
    )

    const [loggingOut, setLoggingOut] = React.useState(false)
    const [showingOptions, setShowingOptions] = React.useState(false)
    const [mainTab, setMainTab] = React.useState(true)
    const [bought, setBought] = React.useState(-1)
    const [message, setMessage] = React.useState("")
    //const [fontSize, setfontSize] = React.useState("")

    const props = {user, userPointer, setShowingOptions}
    debug("userPointer", userPointer, "us", user)

    const SwitchTab = () => <div style={{
        display: "flex", justifyContent: "space-between"
    }}>
        <h1 onClick={() => setMainTab(true)}
            style={{cursor: "pointer", textDecoration: mainTab ? "underline" : undefined}}>
            {/*opacity: !mainTab ? 0.5 : 1*/}
            {'Browse Latest Cards'}<Star/>
        </h1>

        <h1 onClick={() => setMainTab(false)}
            style={{cursor: "pointer", textDecoration: !mainTab ? "underline" : undefined}}>
            {'Get New Cards'}<AttachMoney/>
        </h1>
    </div>

    const showPackSize = 6
    const packSize = 15
    const prevHeight = 170
    const prevWidth = Math.floor(prevHeight / hiresCardHeight * hiresCardWidth)

    function buyPack() {
        setBought(-2)
        setTimeout(() => {
            setBought(0)
            let interval = undefined
            interval = setInterval(() => {
                setBought(prev => {
                    if (prev < packSize)
                        return prev + 1
                    else {
                        clearInterval(interval)
                        return prev
                    }
                })
            }, 200)
        }, 1000)
    }

    let isRevealingMore = bought > showPackSize
    let showLen = isRevealingMore ? packSize : showPackSize
    const MainContent = () =>
        mainTab
            ? <div>
                <SwitchTab/>
                <span>{'Let us know how you like these:'}</span>
                <div className="homeCardsSection">
                    {cards.length === 0 ? <CircularProgress/> : cards.map(x =>
                        // .filter(x => x).slice(start, start + 2)
                        getImg(x, true, undefined, {margin: 12})
                    )}
                </div>

                {/*<div className="homeNextPrev">
                    <IconButton disabled={start === 0} size="large" color="info" onClick={() => setStart(start - 1)}>
                        <SkipPrevious fontSize="large"/>
                    </IconButton>
                    <IconButton disabled={start >= cards.length - 2} size="large" color="info"
                                onClick={() => setStart(start + 1)}>
                        <SkipNext fontSize="large"/>
                    </IconButton>
                </div>*/}
            </div>
            : <div>
                <SwitchTab/>
                <span>{'Buy a pack of ' + packSize + ' cards and play!'}</span>

                {/*
                <TextField value={fontSize} onChange={x => setfontSize(x.target.value)}/>
                */}

                {bought === -2 ?
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <CircularProgress/>
                    </div>
                    :
                    <div className="homeCardsSection" style={{flexWrap: "wrap"}}>
                        {repeat(showLen, "").map((x, i) => {
                                const scale = bought < i ? 0.4 : 0.8
                                return <div key={"r" + i} style={{
                                    opacity: i == showLen - 1 && showLen !== packSize ? 0.5 : 1,
                                    transformOrigin: "bottom center",
                                    // marginLeft: -14,
                                    transform: "scale(" + scale + ")",
                                    // isRevealingMore ? ... : "scale(" + scale + ") rotate(" + lerp(-15, 15, (i + 1) / (showLen + 1)) + "deg)",
                                    backgroundImage: 'url("' + hiddenCardPath + '")',
                                    backgroundSize: prevWidth + "px " + prevHeight + "px",
                                    height: prevHeight,
                                    width: prevWidth
                                }}/>
                            }
                        )}
                    </div>
                }

                <div style={{display: "flex", justifyContent: "center"}}>
                    {bought >= packSize ?
                        <Button onClick={() => setBought(-1)}
                                variant="outlined" color="info">
                            {'OK'}
                        </Button>
                        :
                        bought === -1 && <Button
                            onClick={() => buyPack()}
                            variant="outlined" color="info">
                            {'Buy'}
                        </Button>}
                </div>
            </div>

    const scrollY: any = {overflowY: "overlay", overflowX: "hidden"} // height < 900 ? ... : undefined

    return loggingOut ? <LoadingProgress/> : !isAuthenticated ? <LoginFirst/> : !user ? <LoadingProgress/> :
        <div className="homeContainer homeWrapper" style={{fontSize}}>
            <div className="homeTitle">
                <h1>
                    {'Welcome to ' + baseGameNameShort + ', ' + capitalize(user?.displayName) + '.'}
                </h1>
                <div>{message}</div>
                {user.isAdmin && <div>
                    <Button variant="outlined" size="large" color="info"
                            href="/admin">
                        {'Admin'}
                    </Button>
                    <Button variant="outlined" size="large" color="info" href="/mint">
                        {'Minter'}
                    </Button>
                    <Button variant="outlined" size="large" color="info" href="/new?admin=1">
                        {'New'}
                    </Button>
                    <Button variant="outlined" size="large" color="info"
                            href={"/api/trigger/[Enter TRIGGER_SECRET_KEY yourself]"}>
                        {'Trigger'}
                    </Button>
                    {/*badWords && <div>
                        <TextField value={message} onChange={x => setMessage(x.target.value)}/>
                        <br/>
                        ID for {message} is {getId(parseFloat(message), badWords)}
                    </div>*/}
                </div>}
            </div>
            <div className="homeOptions">
                <Button disabled={loggingOut} size="large" color="info" onClick={() => {
                    setShowingOptions(!showingOptions)
                }}>
                    <Settings fontSize="large"/> {'Options'}
                </Button>

                <Button disabled={loggingOut} size="large" color="info" onClick={() => {
                    setLoggingOut(true)
                    logOut(() => {
                        window.location.href = "/start"
                    })
                }}>
                    <Logout fontSize="large"/> {'Log out'}
                </Button>
            </div>

            <div className="homeDecks rightBoxBg" style={scrollY}>
                {showingOptions ? <OptionsPanel {...props}/> :
                    <>
                        <h1>{'Your Deck'}</h1>

                        <DeckSelect onChange={deck => fetchDeck(deck)}/>

                        <div style={{height: 20}}/>

                        {deckCards?.map((x, i) =>
                            <SimpleTooltip
                                key={"prev" + x.name}
                                title={getImg(x.name, false, undefined, {marginLeft: -122}, true)}
                                placement="left">
                                <div className="homeDeckCard" key={i}>
                                    <span className="homeDeckCardName">
                                        {x.name}
                                    </span>
                                    <span className="homeDeckCardCost">
                                        {x.cost ? repeat(x.cost, "△").join("") : "Archetype"}
                                    </span>
                                </div>
                            </SimpleTooltip>
                        )}
                    </>}
            </div>

            <div className="homeMain">
                {/* preload next page, <img> with height 0, same position, it needs to be somewhere */}
                {/*cards.slice(start + 2, start + 4).filter(x => x).map(x =>
                    getImg(x, false, 0)
                )*/}
            </div>

            <div className="homeMain leftBoxBg" style={scrollY}>
                <MainContent/>
            </div>

            <div className="homeCommunity">
                <JoinDiscord simple/>
            </div>

            <div className="homeActions">
                <Button variant="contained" size="large" color="info" href="/solo">
                    {'Learn how to play'}
                </Button>

                <Button variant="contained" size="large" color="primary" href="/now">
                    {'Challenge another player'}
                </Button>
            </div>
        </div>
}

export default function HomePage() {
    return (
        <Layout title={gameName("Home")} noCss gameCss mui>
            <HohApiWrapper>
                <HomeLogic/>
            </HohApiWrapper>
        </Layout>
    )
}
