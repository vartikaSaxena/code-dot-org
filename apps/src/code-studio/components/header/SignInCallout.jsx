import React from 'react';
import cookies from 'js-cookie';

const CALLOUT_COLOR = '#454545';
const TRIANGLE_BASE = 30;
const TRIANGLE_HEIGHT = 15;
const CALLOUT_Z_INDEX = 1040;
const CALLOUT_TOP = 30;

const HideSignInCallout = 'hide_signin_callout';

const styles = {
  container: {
    // The outermost div is relatively positioned so it can be used as a positional
    // anchor for its children (which will be absolutely positioned to avoid affecting
    // layout).  This element must be 0-sized to avoid affecting layout.
    position: 'relative',
    height: 0,
    width: 0
  },
  content: {
    position: 'absolute',
    top: CALLOUT_TOP,
    right: -90,
    zIndex: CALLOUT_Z_INDEX,
    backgroundColor: CALLOUT_COLOR,
    borderRadius: 3
  },
  modalBackdrop: {
    // Most backdrop attributes come from the 'modal-backdrop' class defined by bootstrap
    // but we need to override the opacity as the default opacity of 0.8 is too dark.
    // Note that bootstrap defaults the z-index of the backdrop to 1040.
    opacity: 0.5
  },
  upTriangle: {
    position: 'absolute',
    top: CALLOUT_TOP - TRIANGLE_HEIGHT,
    left: -(TRIANGLE_HEIGHT / 2.0),
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: TRIANGLE_BASE,
    borderBottomWidth: TRIANGLE_HEIGHT,
    borderLeftWidth: TRIANGLE_BASE,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: CALLOUT_COLOR,
    borderLeftColor: 'transparent',
    zIndex: CALLOUT_Z_INDEX
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 20
  },
  imageContainer: {
    width: 100,
    marginRight: 20
  },
  textContainer: {
    width: 400,
    textAlign: 'left',
    whiteSpace: 'normal'
  },
  textHeader: {
    marginTop: 0
  }
};

/*
 * This is a callout attached to the sign-in button that's used on CSF level
 * pages to remind the user to sign-in.  Note that the sign-in button is
 * defined in shared/haml/user_header.haml and is not a React component.
 * This component is injected into the page by src/code-studio/header.js.
 */
export default class SignInCallout extends React.Component {
  constructor(props) {
    super(props);

    this.closeCallout = this.closeCallout.bind(this);
    this.getContent = this.getContent.bind(this);

    sessionStorage.setItem(HideSignInCallout, false);
    cookies.setItem(HideSignInCallout, false);

    this.state = {
      showCallout: true,
      hasBeenDismissed:
        cookies.getItem(HideSignInCallout) ||
        sessionStorage.getItem(HideSignInCallout)
    };
  }

  closeCallout(event) {
    this.setState({showCallout: false, hasBeenDismissed: true});
    cookies.setItem(HideSignInCallout, 'true', {expires: 1, path: '/'});
    sessionStorage.setItem(HideSignInCallout, true);
    event.preventDefault();
  }

  getContent() {
    return (
      <div style={styles.contentContainer}>
        <div style={styles.imageContainer}>
          <img src="/shared/images/user-not-signed-in.png" />
        </div>
        <div style={styles.textContainer}>
          <h2 style={styles.textHeader}>You are not signed in</h2>
          <p>
            You don't need an account to work on this lesson, but if you want to
            save your work, remember to sign in or create an account before you
            get started.
          </p>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.showCallout && !this.state.hasBeenDismissed) {
      return (
        <div style={styles.container}>
          <div
            className="modal-backdrop"
            style={styles.modalBackdrop}
            onClick={this.closeCallout}
          />
          <div style={styles.upTriangle} />
          <div style={styles.content}>{this.getContent()}</div>
        </div>
      );
    } else {
      return <div />;
    }
  }
}
