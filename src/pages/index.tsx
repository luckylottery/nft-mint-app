import { useEffect } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import cookie from "cookie";
import { useDispatch, useSelector } from "react-redux";
import { Collection } from "types";
import { RootState } from "utils/store";
import SEO from "utils/SEO";
import Card from "ui/components/Card";
import Navbar from "ui/components/Navbar";
import { requestAccount } from "features/user/actions";

type IndexProps = {
	collections: Collection[];
};

const Index = ({ collections }: IndexProps) => {
	const user = useSelector((state: RootState) => state.user);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!user.data?.address) {
			requestAccount(dispatch);
		}
	}, [user.data?.address, dispatch]);

	return (
		<div className="container mx-auto">
			<SEO url="/" />
			<Navbar
				address={user.data?.address}
				balance={user.data?.balance}
				shortAddress={user.data?.shortAddress}
				network={user.data?.network}
				signIn={() => requestAccount(dispatch)}
			/>
			<section className="pt-8 px-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-10">
					{collections.map(({ id, title, cover_photo }) => (
						<div key={id}>
							<Link href={`/collection/${id}`}>
								<a className="w-full h-full">
									<Card
										photo={cover_photo.urls.regular}
										title={title}
										alt={title}
									/>
								</a>
							</Link>
						</div>
					))}
				</div>
			</section>
		</div>
	);
};

export const getServerSideProps: GetServerSideProps = async (
	ctx
): Promise<any> => {
	const cookies = cookie.parse(ctx.req.headers.cookie || "");

	if (cookies.access_token) {
		const accessToken = cookies.access_token;

		if (accessToken) {
			const headers = {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			};

			const meResponse = await fetch("https://api.unsplash.com/me", headers);
			const me = await meResponse.json();

			const response = await fetch(
				`https://api.unsplash.com/users/${me.username}/collections?page=1`,
				headers
			);
			const collections = await response.json();

			return {
				props: {
					collections,
				},
			};
		} else {
			return {
				redirect: {
					destination: "/signin",
				},
			};
		}
	}

	return {
		redirect: {
			destination: "/signin",
		},
	};
};

export default Index;
