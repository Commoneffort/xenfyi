import { ConnectKitButton } from "connectkit";
import { InjectedConnector } from "wagmi/connectors/injected";
import Link from "next/link";
import {
  MoonIcon,
  SunIcon,
  BookOpenIcon,
  DotsVerticalIcon,
  ViewGridIcon,
  LockClosedIcon,
  GiftIcon,
} from "@heroicons/react/outline";
import {
  TwitterIcon,
  TelegramIcon,
  GitHubIcon,
  DiamondIcon,
  WalletIcon,
  DiscordIcon,
} from "./Icons";
import { xenContract } from "~/lib/xen-contract";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { clsx } from "clsx";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { StatusBadge } from "./StatusBadge";
import { navigationItems } from "~/components/Constants";

const linkItems = [
  {
    name: "Docs",
    icon: <BookOpenIcon className="h-5 w-5" />,
    href: "https://xensource.gitbook.io/www.xenpedia.io/",
  },
  {
    name: "Twitter",
    icon: <TwitterIcon />,
    href: "https://twitter.com/XEN_Crypto​",
  },
  {
    name: "Telegram",
    icon: <TelegramIcon />,
    href: "https://t.me/XENCryptoTalk",
  },
  {
    name: "Discord",
    icon: <DiscordIcon />,
    href: "https://discord.gg/rcAhrKWJb6",
  },
  {
    name: "GitHub",
    icon: <GitHubIcon />,
    href: "https://github.com/FairCrypto",
  },
  // {
  //   name: "Gift XEN",
  //   icon: <GiftIcon className="h-5 w-5" />,
  //   href: "https://etherscan.io/address/0x806f5d470ee7dd7b7a8ceb092d3fa7ef00a70576",
  // },
];

const Navbar = () => {
  const router = useRouter();
  const { chain } = useNetwork();
  const [mintPageOverride, setMintPageOverride] = useState(1);
  const [stakePageOverride, setStakePageOverride] = useState(1);
  const { connector, address, isConnected } = useAccount();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data: userMint } = useContractRead({
    ...xenContract(chain),
    functionName: "getUserMint",
    overrides: { from: address },
    watch: true,
  });

  const { data: userStake } = useContractRead({
    ...xenContract(chain),
    functionName: "getUserStake",
    overrides: { from: address },
    watch: true,
  });

  const NavigationItems = (props: any) => {
    return (
      <>
        {navigationItems.map((item, index) => (
          <li key={index}>
            <Link
              href={(() => {
                switch (index) {
                  case 1:
                    return `/mint/${mintPageOverride}`;
                  case 2:
                    return `/stake/${stakePageOverride}`;
                  default:
                    return item.href;
                }
              })()}
            >
              <a
                className={clsx({
                  "btn-disabled text-neutral-content":
                    router.pathname.startsWith(item.href),
                  "glass text-neutral": !router.pathname.startsWith(item.href),
                })}
                onClick={() => {
                  (document.activeElement as HTMLElement).blur();
                }}
              >
                {item.icon}
                {item.name}
                <StatusBadge
                  status={{
                    id: item.id,
                    mintPageOverride: mintPageOverride,
                    stakePageOverride: stakePageOverride,
                    offset: "right-2 lg:-top-2 lg:-right-3",
                  }}
                />
              </a>
            </Link>
          </li>
        ))}
      </>
    );
  };

  useEffect(() => {
    if (userMint && !userMint.term.isZero()) {
      setMintPageOverride(2);
      if (userMint.maturityTs < Date.now() / 1000) {
        setMintPageOverride(3);
      }
    } else {
      setMintPageOverride(1);
    }
    if (userStake && !userStake.term.isZero()) {
      setStakePageOverride(2);
      if (userStake.maturityTs < Date.now() / 1000) {
        setStakePageOverride(3);
      }
    } else {
      setStakePageOverride(1);
    }
  }, [userMint, userStake]);

  return (
    <div className="navbar">
      <div className="navbar-start space-x-2">
        <a className="text-neutral normal-case text-3xl font-light">XEN</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal glass rounded-box p-2 space-x-4">
          <NavigationItems />
        </ul>
      </div>
      <div className="navbar-end space-x-4">
        <ConnectKitButton.Custom>
          {({ show, truncatedAddress }) => {
            return (
              <button onClick={show} className="btn glass text-neutral">
                {isConnected ? (
                  <div className="flex space-x-2 items-center">
                    <pre className="text-base font-light">
                      {truncatedAddress}
                    </pre>
                  </div>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            );
          }}
        </ConnectKitButton.Custom>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn glass btn-square text-neutral">
            <DotsVerticalIcon className="h-5 w-5" />
          </label>
          <ul
            tabIndex={0}
            className="mt-3 p-2 shadow menu menu-compact dropdown-content glass rounded-box w-52 space-y-2"
          >
            <li>
              <label className="flex swap swap-rotate justify-between text-neutral glass">
                Theme
                <input
                  type="checkbox"
                  onChange={() => {
                    const t = isDark ? "light" : "dark";
                    setTheme(t);
                    (document.activeElement as HTMLElement).blur();
                  }}
                />
                <MoonIcon className="swap-on w-5 h-5 absolute right-4" />
                <SunIcon className="swap-off w-5 h-5 absolute right-4" />
              </label>
            </li>
            {!isMobile && (
              <li>
                <button
                  className="justify-between text-neutral glass"
                  onClick={() => {
                    (connector as InjectedConnector)?.watchAsset?.({
                      address: "0xca41f293A32d25c2216bC4B30f5b0Ab61b6ed2CB",
                      decimals: 18,
                      image: "https://xen.fyi/images/xen.png",
                      symbol: "XEN",
                    });
                    (document.activeElement as HTMLElement).blur();
                  }}
                >
                  Add XEN to Wallet
                  <WalletIcon />
                </button>
              </li>
            )}
            {linkItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href ?? "/"}>
                  <a
                    className="justify-between text-neutral glass"
                    onClick={() => {
                      (document.activeElement as HTMLElement).blur();
                    }}
                  >
                    {item.name}
                    {item.icon}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
