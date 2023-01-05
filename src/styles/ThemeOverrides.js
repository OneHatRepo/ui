const ThemeOverrides = {
	colors: {
		primary: {
			100: '#4D89CC',
			200: '#467DBA',
			300: '#3F71A8',
			400: '#396799',
			500: '#335C89', // default for buttons
			600: '#2E527A',
			700: '#28486B',
			800: '#203A57',
			900: '#182C42',
		},
		// secondary: {
		// 	500: '#1F3854', // default for buttons
		// },
		selected: '#ffc',
		hover: '#eee',
		selectedHover: '#eeb',
		unselected: '#bbb',
		disabled: '#ccc',
		control: '#1B518C',
		vip: '#3a78bc',
		navBlue: '#3b82f6',
		warning: '#d92b2b',
		orange: '#de9000',
		greens: {
			100: '#4CAF50',
			200: '#449E48',
			300: '#3d8C40',
			400: '#357A38',
			500: '#2E6930',
			600: '#265828',
			700: '#1E4620',
			800: '#173518',
			900: '#0F2310',
		},
	},
	// config: {
	// 	initialColorMode: 'dark',
	// },
	Components: {
		Select: {
			defaultProps: {
				h: 50,
				flex: 1,
				bg: '#fff',
				borderWidth: 1,
				borderColor: '#000',
				isDisabled: false,
			},
		},
		Icon: {
			defaultProps: {
				size: 'md',
				color: '#fff',
			},
		},
		Input: {
			variants: {
				form: (props) => {
					const c = props.colorScheme,
						m = props.colorMode,
						isLightMode = m === 'light';
					return {
						autoCapitalize: 'none',
						mb: 4,
						w: '100%',
						h: '50px',

						// BEGIN Taken from variant 'filled'
						bg: props.bg || (isLightMode ? 'muted.200' : 'muted.600'),
						borderWidth: '1',
						borderColor: 'transparent',
						_hover: {
							bg: isLightMode ? 'muted.200' : 'muted.700',
						},
						// END
					};
				},
			},
			defaultProps: {
				size: 'xl',
			},
		},
		Button: {
			variants: {
				footer: (props) => {
					const c = props.colorScheme,
						m = props.colorMode,
						isLightMode = m === 'light';
					
					return {
						flex: 1,
						_text: {
							color: '#fff',
						},
						alignSelf: 'center',
						alignItems: 'center',
						justifyContent: 'center',

						// BEGIN Taken from variant 'solid'
						_web: {
							outlineWidth: '0'
						},
						bg: c + '.800',
						_hover: {
							bg: c + '.600'
						},
						_pressed: {
							bg: c + '.700'
						},
						_focus: {
							bg: c + '.600'
						},
						_loading: {
							bg: isLightMode ? 'warmGray.50' : c + '.300',
							opacity: '50'
						},
						_disabled: {
							_text: {
								color: '#000',
							},
							bg: isLightMode ? 'trueGray.400' : 'trueGray.600',
						},
						// END
					};
				},
				solid2: (props) => {
					const c = props.colorScheme,
						m = props.colorMode,
						isLightMode = m === 'light';
					
					return {
						_text: {
							color: '#fff',
						},
						// BEGIN Taken from variant 'solid'
						_web: {
							outlineWidth: '0'
						},
						bg: 'trueGray.200',
						borderColor: c + '.800',
						borderWidth: 1,
						_hover: {
							bg: 'trueGray.400'
						},
						_pressed: {
							bg: 'trueGray.700'
						},
						_focus: {
							bg: 'trueGray.600',
						},
						_loading: {
							bg: isLightMode ? 'warmGray.50' : c + '.300',
							opacity: '50'
						},
						_disabled: {
							_text: {
								color: '#000',
							},
							bg: isLightMode ? 'trueGray.400' : 'trueGray.600',
						},
						// END
					};
				},
				money: (props) => {
					const c = props.colorScheme,
						m = props.colorMode,
						isLightMode = m === 'light';
					
					return {
						alignSelf: 'center',
						alignItems: 'center',
						justifyContent: 'center',
						color: 'greens.200',
						borderColor: 'greens.200',
						borderWidth: 2,
						borderRadius: 'xl',
						bg: '#fff',
					};
				},
			},
			defaultProps: {
				size: 'lg',
			},
		},
		IconButton: {
			variants: {
				footer: (props) => {
					const c = props.colorScheme,
						m = props.colorMode,
						isLightMode = m === 'light';
					
					return {
						flex: 1,
						alignSelf: 'center',
						alignItems: 'center',
						justifyContent: 'center',

						// BEGIN Taken from variant 'solid'
						_web: {
							outlineWidth: '0'
						},
						bg: c + '.800',
						_hover: {
							bg: c + '.600'
						},
						_pressed: {
							bg: c + '.700'
						},
						_focus: {
							bg: c + '.600'
						},
						_loading: {
							bg: isLightMode ? 'warmGray.50' : c + '.300',
							opacity: '50'
						},
						_disabled: {
							bg: isLightMode ? 'trueGray.400' : 'trueGray.600',
						},
						// END
					};
				},
				solid2: (props) => {
					const c = props.colorScheme,
						m = props.colorMode,
						isLightMode = m === 'light';
					
					return {
						// BEGIN Taken from variant 'solid'
						_web: {
							outlineWidth: '0'
						},
						bg: 'trueGray.200',
						borderColor: c + '.800',
						borderWidth: 1,
						_hover: {
							bg: 'trueGray.400'
						},
						_pressed: {
							bg: 'trueGray.700'
						},
						_focus: {
							bg: 'trueGray.600',
						},
						_loading: {
							bg: isLightMode ? 'warmGray.50' : c + '.300',
							opacity: '50'
						},
						_disabled: {
							bg: isLightMode ? 'trueGray.400' : 'trueGray.600',
						},
						// END
					};
				},
			},
			defaultProps: {
				size: 'lg',
			},
		},
	},
};
export default ThemeOverrides;
