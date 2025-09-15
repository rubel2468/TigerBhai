import { WEBSITE_HOME } from '@/routes/WebsiteRoute'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const WebsiteBreadcrumb = ({ props }) => {
    return (
        <div className="py-10 flex justify-center items-center bg-[url('/assets/images/page-title.png')] bg-cover bg-center">

            <div>
                <h1 className={props.titleClassName || 'text-2xl font-semibold mb-2 text-center'}>
                    {props.titleIcons?.before && (
                        <Image src={props.titleIcons.before} alt="title-before" width={36} height={36} className='inline-block align-middle me-2' />
                    )}
                    <span className='align-middle'>{props.title}</span>
                    {props.titleIcons?.after?.map((icon, idx) => (
                        <Image key={idx} src={icon} alt={`title-after-${idx}`} width={36} height={36} className='inline-block align-middle ms-2' />
                    ))}
                </h1>
                <ul className='flex gap-2 justify-center'>
                    <li><Link href={WEBSITE_HOME} className='font-semibold'>Home</Link></li>

                    {props.links.map((item, index) => (
                        <li key={index}>
                            <span className='me-1'>/</span>
                            {item.href ?
                                <Link href={item.href}>{item.label}</Link>
                                :
                                <span>{item.label}</span>
                            }
                        </li>
                    ))}

                </ul>
            </div>

        </div>
    )
}

export default WebsiteBreadcrumb