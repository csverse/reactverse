import React from 'react'
import styles from './project.module.scss';
import { Badge, Button, Card, Group, Image, Text } from '@mantine/core';

const Projects = () => {
  return (
    <div className={styles['projects']}>
      <h1>Projects</h1>
      <div className={styles['content']}>
        <div className='d-flr j-between'>
          <Card shadow="xs" padding="xs" radius="md" withBorder>
            <Card.Section>
              <Image
                src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                height={160}
                alt="Norway"
              />
            </Card.Section>
            <Text size="xs" c="dimmed">
              With Fjord Tours you can explore more of the magical fjord
            </Text>
            <Button color="blue" fullWidth radius="md">
              Explore more
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Projects
