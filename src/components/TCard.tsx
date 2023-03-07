import React from 'react';
import { Card } from 'react-native-paper';
import TBadge from './atoms/TBadge';

type TCardPropType = React.ComponentProps<typeof Card> & { style?: any };

function TCard({ children, ...props }: TCardPropType) {
    const subComponentList = Object.keys(TCard);

    const subComponents = subComponentList.map((key) => {
        return React.Children.map(children, (child) => {
            const childType = child && child.type && (child.type.displayName || child.type.name);

            return childType.includes(key) ? child : null;
        });
    });

    return <Card {...props}>{subComponents.map((component) => component)}</Card>;
}

const Title = (props) => <Card.Title {...props} />;

TCard.Title = Title;

const Cover = (props) => <Card.Cover {...props} />;

TCard.Cover = Cover;

const Content = (props) => <Card.Content {...props} />;

TCard.Content = Content;

const Action = (props) => <Card.Actions {...props} />;

TCard.Action = Action;

const Badge = (props: { style?: any }) => {
    const style = { position: 'absolute', top: 8, left: 8, textAlign: 'center' };

    return <TBadge {...props} style={[style, props.style]} />;
};

TCard.Badge = Badge;

export default TCard;
