import {
	Linking,
} from 'react-native';
import {
	BoxNative,
	Text,
	TextNative,
} from '@project-components/Gluestack';
import {
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
import UiGlobals from '../../UiGlobals.js';
import withComponent from '../Hoc/withComponent.js';
import _ from 'lodash';

function TextWithLinksElement(props) {
	const {
			value: text,
		} = props,
		styles = UiGlobals.styles,
		openLink = (url) => {
			Linking.openURL(url);
		},
		extractLinks = (text) => {

			if (_.isNil(text) || _.isEmpty(text)) {
				return [];
			}
			const
				regex = /\b(?:https?|ftp):\/\/\S+/g,
				links = text.match(regex) || [];
		
			return links.map((link, ix) => ({
				link,
				key: `link_${ix}`,
			}));
		},
		renderTextWithLinks = () => {
			const links = extractLinks(text);
			let modifiedText = text;

			if (_.isNil(modifiedText) || _.isEmpty(modifiedText)) {
				return null;
			}
	
			links.forEach(({ link, key }) => {
				modifiedText = modifiedText.replace(link, key);
			});

			const
				textClassName = `
					TextWithLinks-Text
					text-base
					overflow-hidden
				`,
				textSegments = modifiedText.split(/(link_\d+)/);
			if (textSegments.length === 1) {
				return <Text className={textClassName}>{modifiedText}</Text>;
			}

			return textSegments.map((segment, ix) => {
				const foundLink = links.find(({ key }) => segment === key);
				let ret = <Text key={ix} className={textClassName}>{segment}</Text>;
		
				if (foundLink) {
					ret = <TextNative
								key={foundLink.key}
								className={`
									text-blue-600
									${textClassName}
								`}
								onPress={() => openLink(foundLink.link)}
							>{foundLink.link}</TextNative>;
				}
				return ret;
			});
		};
  
	const elementProps = {};
	if (UiGlobals.mode === UI_MODE_WEB) {
		elementProps.textOverflow = 'ellipsis';
	}
	let className = `
		overflow-auto
		min-h-[40px]
		px-3
		py-2
	`;
	if (props.className) {
		className += ` ${props.className}`;
	}
	return <BoxNative
				className={className}
				{...props}
			>{renderTextWithLinks()}</BoxNative>;
};

export default withComponent(TextWithLinksElement);
