import {
	Linking,
} from 'react-native';
import {
	BoxNative, // because this could be in a GridRow, which adds an isRowSelectable prop
	Text,
	TextNative,
} from '@onehat-gluestack';
import clsx from 'clsx';
import {
	CURRENT_MODE,
	UI_MODE_WEB,
} from '../../Constants/UiModes.js';
import testProps from '../../Functions/testProps.js';
import UiGlobals from '../../UiGlobals.js';
import withComponent from '../Hoc/withComponent.js';
import _ from 'lodash';

function extractTextSize(className: string): string | null {
	// Matches "text-" followed by any alphanumeric text size scale (e.g., xs, sm, base, xl, 2xl, 3xl)
	const match = className.match(/\btext-(xs|sm|base|md|lg|xl|\d?xl)\b/);
	return match ? 'text-' + match[1] : null; 
}

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
				textSize = extractTextSize(props.className),
				textClassName = clsx(
					'TextWithLinks-Text',
					'flex-1',
					// 'min-h-[40px]',
					// 'px-3',
					'overflow-hidden', // override parent
					styles.FORM_TEXT_CLASSNAME,
					// props.className,
					textSize,
				),
				textSegments = modifiedText.split(/(link_\d+)/);
			if (textSegments.length === 1) {
				return <Text className={textClassName}>{modifiedText}</Text>;
			}

			return textSegments
						.filter(segment => segment && segment.trim() !== '') // remove empty segments
						.map((segment, ix) => {
							const foundLink = links.find(({ key }) => segment === key);
							let ret = <Text key={ix} className={textClassName}>{segment}</Text>;
					
							if (foundLink) {
								ret = <TextNative
											{...testProps('link_' + ix)}
											key={foundLink.key}
											className={clsx(
												'text-blue-600',
												textClassName,
											)}
											onPress={() => openLink(foundLink.link)}
										>{foundLink.link}</TextNative>;
							}
							return ret;
						});
		};
  
	const elementProps = {};
	if (CURRENT_MODE === UI_MODE_WEB) {
		elementProps.textOverflow = 'ellipsis';
	}
	const className = clsx(
		'TextWithLinks-Box',
		'overflow-auto',
		// 'min-h-[40px]',
		props.className,
	);
	return <BoxNative
				className={className}
				{...props}
			>{renderTextWithLinks()}</BoxNative>;
};

export default withComponent(TextWithLinksElement);
